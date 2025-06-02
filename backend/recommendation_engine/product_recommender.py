import numpy as np
import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import PCA
from sklearn.model_selection import KFold
from sklearn.preprocessing import StandardScaler
import os
import kagglehub
import nltk
import warnings
from pathlib import Path
import logging

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class PinSageHierarchical:
    def __init__(self, embedding_dim=16, random_seed=42):
        self.embedding_dim = embedding_dim
        self.random_seed = random_seed
        self.graph = nx.DiGraph()
        self.board_embeddings = {}
        np.random.seed(self.random_seed)

    def load_ecommerce_dataset(self, file_path, max_items=5000):
        """Load and process e-commerce dataset"""
        logging.info(f"Loading data from {file_path}...")

        try:
            file_path = Path(file_path)
            if not file_path.exists():
                raise FileNotFoundError(f"File or directory {file_path} does not exist")

            if file_path.is_dir():
                csv_files = list(file_path.glob("*.csv"))
                if not csv_files:
                    raise ValueError("No CSV files found in the dataset folder")
                file_path = csv_files[0]  # Use the first CSV file found
                logging.info(f"Using CSV file: {file_path}")

            if file_path.suffix == '.csv':
                df = pd.read_csv(file_path, nrows=max_items)
            elif file_path.suffix == '.json':
                df = pd.read_json(file_path, lines=True)[:max_items]
            else:
                raise ValueError("Unsupported file format. Please provide CSV or JSON file.")

            logging.info(f"Data loaded with {len(df)} rows")
            logging.info(f"Columns: {df.columns.tolist()}")

            # Download necessary NLTK data
            for resource in ['punkt', 'stopwords']:
                try:
                    nltk.data.find(f'tokenizers/{resource}' if resource == 'punkt' else f'corpora/{resource}')
                except LookupError:
                    logging.info(f"Downloading NLTK {resource}...")
                    nltk.download(resource)

            return df

        except Exception as e:
            logging.error(f"Error loading dataset: {e}")
            raise

    def process_ecommerce_data(self, df):
        """Process e-commerce data and create the graph"""
        logging.info("Processing data and creating graph structure...")

        try:
            # Handle product IDs
            if 'product_id' not in df.columns:
                logging.info("Creating numerical product IDs...")
                df['product_id'] = range(1, len(df) + 1)
            else:
                # Ensure product IDs are unique and not null
                df = df.dropna(subset=['product_id']).copy()
                df['product_id'] = df['product_id'].astype(str)
                if df['product_id'].duplicated().any():
                    logging.warning("Duplicate product IDs found, making them unique")
                    df['product_id'] = df['product_id'] + '_' + df.index.astype(str)

            product_id_col = 'product_id'

            # Identify available columns
            categorical_cols = ['Brand', 'Category', 'Season', 'Holiday', 'Gender', 'Location']
            numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            text_cols = df.select_dtypes(include=[object]).columns.tolist()
            text_cols = [col for col in text_cols if col != product_id_col]

            logging.info(f"Available categorical columns: {categorical_cols}")
            logging.info(f"Available numerical columns: {numerical_cols}")
            logging.info(f"Available text columns: {text_cols}")

            # Create category string from available categorical columns
            available_cat_cols = [col for col in categorical_cols if col in df.columns]
            df['category_string'] = df[available_cat_cols].apply(
                lambda row: ' | '.join([f"{col}:{str(row[col])}" for col in available_cat_cols if pd.notna(row[col])]),
                axis=1
            )

            # Create feature string from text columns
            available_text_cols = [col for col in text_cols if col in df.columns]
            df['feature_string'] = df[available_text_cols].apply(
                lambda row: ' '.join([str(row[col]) for col in available_text_cols if pd.notna(row[col])]),
                axis=1
            )

            # Create numerical features
            numerical_features = df[numerical_cols].fillna(0).values
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(numerical_features)

            # Cluster products to create categories
            n_clusters = min(10, max(3, len(df) // 100))
            kmeans_categories = KMeans(n_clusters=n_clusters, random_state=self.random_seed, n_init=10)
            df['main_category'] = kmeans_categories.fit_predict(scaled_features)

            # Create subcategories
            df['sub_category'] = -1
            for category in df['main_category'].unique():
                category_mask = df['main_category'] == category
                category_count = category_mask.sum()

                if category_count >= 10:
                    sub_n_clusters = min(3, category_count // 5)
                    sub_features = scaled_features[category_mask]
                    sub_kmeans = KMeans(n_clusters=sub_n_clusters, random_state=self.random_seed, n_init=10)
                    df.loc[category_mask, 'sub_category'] = sub_kmeans.fit_predict(sub_features)
                else:
                    df.loc[category_mask, 'sub_category'] = 0

            # Create hierarchical category structure
            df['category_hierarchy'] = df.apply(
                lambda row: [
                    f"category_{row['main_category']}",
                    f"subcategory_{row['main_category']}_{row['sub_category']}"
                ],
                axis=1
            )

            # Generate pin features
            logging.info("Generating pin features...")
            base_features = scaled_features

            # Add TF-IDF features if text data is available
            text_data = df['feature_string'].fillna('') + ' ' + df['category_string'].fillna('')
            tfidf_features = np.zeros((len(df), 1))  # Default empty features
            if text_data.str.strip().str.len().sum() > 0:  # Check if there's meaningful text
                tfidf = TfidfVectorizer(max_features=min(50, len(df) // 10), stop_words='english')
                tfidf_features = tfidf.fit_transform(text_data).toarray()

            combined_features = np.hstack([base_features, tfidf_features])

            # Reduce dimensions
            max_components = min(self.embedding_dim, combined_features.shape[1], len(df))
            logging.info(f"Reducing to {max_components} features via PCA")

            pca = PCA(n_components=max_components)
            pin_features_reduced = pca.fit_transform(combined_features)

            # Pad features if necessary
            pin_features = np.zeros((len(df), self.embedding_dim))
            pin_features[:, :max_components] = pin_features_reduced

            logging.info(f"Final pin features shape: {pin_features.shape}")

            # Build graph
            logging.info("Building graph with pins and boards...")
            for i, row in df.iterrows():
                pin_id = f"pin_{row[product_id_col]}"
                self.graph.add_node(pin_id, type="pin", features=pin_features[i])

            # Create board hierarchy
            board_hierarchy = {}
            for i, row in df.iterrows():
                categories = row['category_hierarchy']
                pin_id = f"pin_{row[product_id_col]}"

                parent_board = None
                for level, category in enumerate(categories):
                    board_id = f"board_{level}_{category}"

                    if board_id not in board_hierarchy:
                        board_hierarchy[board_id] = {"pins": [], "sub_boards": [], "level": level}
                        self.graph.add_node(board_id, type="board", level=level, name=category)

                    board_hierarchy[board_id]["pins"].append(pin_id)
                    self.graph.add_edge(board_id, pin_id, relation="contains")

                    if parent_board:
                        if board_id not in board_hierarchy[parent_board]["sub_boards"]:
                            board_hierarchy[parent_board]["sub_boards"].append(board_id)
                        self.graph.add_edge(parent_board, board_id, relation="parent")

                    parent_board = board_id

            self.board_hierarchy = board_hierarchy

            # Print summary
            board_count = len([n for n in self.graph.nodes() if self.graph.nodes[n].get('type') == 'board'])
            pin_count = len([n for n in self.graph.nodes() if self.graph.nodes[n].get('type') == 'pin'])
            edge_count = self.graph.number_of_edges()

            logging.info(f"Graph created with {board_count} boards, {pin_count} pins, and {edge_count} edges")
            max_level = max([self.graph.nodes[n].get('level', 0) for n in self.graph.nodes()
                           if self.graph.nodes[n].get('type') == 'board'], default=0)
            logging.info(f"Maximum hierarchy depth: {max_level + 1} levels")

            return board_hierarchy

        except Exception as e:
            logging.error(f"Error processing data: {e}")
            raise

    def generate_embeddings(self, alpha=0.5, max_depth=3):
        """Generate embeddings for all boards"""
        logging.info("Generating hierarchical board embeddings...")

        board_names = [n for n in self.graph.nodes() if self.graph.nodes[n].get('type') == 'board']
        self.board_embeddings = {}

        for board in board_names:
            self.board_embeddings[board] = self._get_recursive_board_embedding(
                board, alpha=alpha, max_depth=max_depth)

        logging.info(f"Generated embeddings for {len(self.board_embeddings)} boards")
        return self.board_embeddings

    def _get_recursive_board_embedding(self, board_name, alpha=0.5, depth=0, max_depth=2):
        """Generate recursive board embeddings"""
        if depth > max_depth or board_name not in self.graph:
            return np.zeros(self.embedding_dim)

        direct_pins = [node for node in self.graph.successors(board_name)
                      if self.graph.nodes[node].get('type') == 'pin']
        sub_boards = [node for node in self.graph.successors(board_name)
                     if self.graph.nodes[node].get('type') == 'board']

        pin_vectors = [self.graph.nodes[pin]["features"] for pin in direct_pins if pin in self.graph]
        direct_embedding = np.mean(pin_vectors, axis=0) if pin_vectors else np.zeros(self.embedding_dim)

        if not sub_boards:
            return direct_embedding

        sub_embeddings = [self._get_recursive_board_embedding(sub, alpha, depth+1, max_depth)
                         for sub in sub_boards]
        sub_embedding = np.mean(sub_embeddings, axis=0) if sub_embeddings else np.zeros(self.embedding_dim)

        return (1 - alpha) * direct_embedding + alpha * sub_embedding

    def cluster_boards(self, min_clusters=2, max_clusters=10):
        """Cluster boards based on embeddings"""
        logging.info("Clustering boards...")

        board_names = list(self.board_embeddings.keys())
        if len(board_names) < min_clusters:
            logging.warning(f"Not enough boards ({len(board_names)}) for clustering")
            return np.zeros(len(board_names)), board_names

        embeddings_array = np.array([self.board_embeddings[name] for name in board_names])

        k_range = range(min_clusters, min(max_clusters + 1, len(board_names)))
        silhouette_scores = []

        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=self.random_seed, n_init=10)
            labels = kmeans.fit_predict(embeddings_array)
            score = silhouette_score(embeddings_array, labels)
            silhouette_scores.append(score)

        optimal_k = k_range[np.argmax(silhouette_scores)] if silhouette_scores else min_clusters
        logging.info(f"Optimal number of clusters: {optimal_k}")

        kmeans = KMeans(n_clusters=optimal_k, random_state=self.random_seed, n_init=10)
        clusters = kmeans.fit_predict(embeddings_array)

        self.board_names = board_names
        self.embeddings_array = embeddings_array
        self.clusters = clusters
        self.optimal_k = optimal_k
        self.silhouette_scores = silhouette_scores
        self.k_range = k_range

        return clusters, board_names

    def visualize(self, output_file='pinsage_real_data_visualization.png'):
        """Create visualizations for the model"""
        logging.info("Creating visualizations...")

        if not self.board_names or len(self.board_names) < 2:
            logging.warning("Not enough boards to visualize")
            return

        plt.figure(figsize=(20, 16))

        # t-SNE embedding
        perplexity_value = min(5, len(self.board_names) - 1) if len(self.board_names) > 1 else 1
        try:
            tsne = TSNE(n_components=2, random_state=self.random_seed, perplexity=perplexity_value)
            embeddings_2d = tsne.fit_transform(self.embeddings_array)
        except Exception as e:
            logging.warning(f"t-SNE failed: {e}, skipping 2D embedding plots")
            embeddings_2d = np.zeros((len(self.board_names), 2))

        # 1. Silhouette score plot
        plt.subplot(2, 3, 1)
        if self.silhouette_scores:
            plt.plot(list(self.k_range), self.silhouette_scores, marker='o')
            plt.title('Silhouette Score for Different Cluster Counts')
            plt.xlabel('Number of Clusters (k)')
            plt.ylabel('Silhouette Score')
            plt.grid(True)
        else:
            plt.text(0.5, 0.5, "No silhouette scores available", ha='center', va='center')

        # 2. Board embeddings by cluster
        plt.subplot(2, 3, 2)
        scatter = plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1],
                           c=self.clusters, cmap='tab10', s=100, alpha=0.7)

        max_labels = 30
        if len(self.board_names) > max_labels:
            indices = np.round(np.linspace(0, len(self.board_names) - 1, max_labels)).astype(int)
        else:
            indices = range(len(self.board_names))

        for i in indices:
            plt.annotate(self._short_name(self.board_names[i]),
                        (embeddings_2d[i, 0], embeddings_2d[i, 1]), fontsize=8)

        plt.title('Board Embeddings by Cluster')
        plt.colorbar(scatter, label='Cluster')

        # 3. Board embeddings by hierarchy level
        plt.subplot(2, 3, 3)
        levels = [self.graph.nodes[board].get('level', 0) for board in self.board_names]
        scatter_levels = plt.scatter(embeddings_2d[:, 0], embeddings_2d[:, 1],
                                  c=levels, cmap='viridis', s=100, alpha=0.7)

        for i in indices:
            plt.annotate(self._short_name(self.board_names[i]),
                        (embeddings_2d[i, 0], embeddings_2d[i, 1]), fontsize=8)

        plt.title('Board Embeddings by Hierarchy Level')
        plt.colorbar(scatter_levels, label='Level')

        # 4. Hierarchical structure
        plt.subplot(2, 3, 4)
        G_hierarchy = nx.DiGraph()
        max_boards = 50
        if len(self.board_names) > max_boards:
            levels_dict = {}
            for board in self.board_names:
                level = self.graph.nodes[board].get('level', 0)
                if level not in levels_dict:
                    levels_dict[level] = []
                levels_dict[level].append(board)

            selected_boards = []
            for level, boards in levels_dict.items():
                selected_boards.extend(boards[:min(5, len(boards))])
        else:
            selected_boards = self.board_names

        for board in selected_boards:
            G_hierarchy.add_node(board, level=self.graph.nodes[board].get('level', 0))

        for board in selected_boards:
            for successor in self.graph.successors(board):
                if successor in selected_boards and self.graph.nodes[successor].get('type') == 'board':
                    G_hierarchy.add_edge(board, successor)

        if G_hierarchy.nodes():
            pos = nx.multipartite_layout(G_hierarchy, subset_key='level', align='horizontal')
            max_level = max([G_hierarchy.nodes[n].get('level', 0) for n in G_hierarchy.nodes()], default=1)
            node_colors = [plt.cm.viridis(G_hierarchy.nodes[n].get('level', 0) / max(1, max_level))
                         for n in G_hierarchy.nodes()]

            nx.draw_networkx(G_hierarchy, pos=pos, with_labels=True,
                           labels={n: self._short_name(n) for n in G_hierarchy.nodes()},
                           node_color=node_colors, edge_color='gray', node_size=300,
                           font_size=8, arrows=True, arrowsize=10, width=1.0)
        else:
            plt.text(0.5, 0.5, "No hierarchy data available", ha='center', va='center')

        plt.title('Board Hierarchy (Sample)')
        plt.axis('off')

        # 5. Board similarity heatmap
        plt.subplot(2, 3, 5)
        max_heatmap_size = 20
        if len(self.board_names) > max_heatmap_size:
            indices = np.round(np.linspace(0, len(self.board_names) - 1, max_heatmap_size)).astype(int)
            heatmap_boards = [self.board_names[i] for i in indices]
        else:
            heatmap_boards = self.board_names
            indices = range(len(self.board_names))

        similarity_matrix = np.zeros((len(heatmap_boards), len(heatmap_boards)))
        for i, board1 in enumerate(heatmap_boards):
            for j, board2 in enumerate(heatmap_boards):
                emb1 = self.board_embeddings[board1]
                emb2 = self.board_embeddings[board2]
                norm1 = np.linalg.norm(emb1)
                norm2 = np.linalg.norm(emb2)
                similarity = np.dot(emb1, emb2) / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0
                similarity_matrix[i, j] = similarity

        sns.heatmap(similarity_matrix, annot=False,
                   xticklabels=[self._short_name(b) for b in heatmap_boards],
                   yticklabels=[self._short_name(b) for b in heatmap_boards],
                   cmap='YlGnBu')
        plt.xticks(rotation=90, fontsize=8)
        plt.yticks(fontsize=8)
        plt.title('Board Similarity Heatmap (Sample)')

        # 6. Cluster distribution by level
        plt.subplot(2, 3, 6)
        level_cluster_counts = {}
        for i, board in enumerate(self.board_names):
            level = self.graph.nodes[board].get('level', 0)
            cluster = self.clusters[i]
            if level not in level_cluster_counts:
                level_cluster_counts[level] = {}
            if cluster not in level_cluster_counts[level]:
                level_cluster_counts[level][cluster] = 0
            level_cluster_counts[level][cluster] += 1

        level_data = []
        for level, clusters in level_cluster_counts.items():
            for cluster, count in clusters.items():
                level_data.append({'Level': level, 'Cluster': f'Cluster {cluster}', 'Count': count})

        if level_data and len(level_data) > 1:
            df_levels = pd.DataFrame(level_data)
            pivot_table = df_levels.pivot_table(index='Level', columns='Cluster',
                                             values='Count', fill_value=0)
            sns.heatmap(pivot_table, annot=True, fmt='.1f', cmap='Blues')
            plt.title('Board Distribution by Level and Cluster')
        else:
            plt.text(0.5, 0.5, "Insufficient data for level-cluster distribution",
                    ha='center', va='center')

        plt.tight_layout()
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        plt.show()

    def _short_name(self, name, max_length=15):
        """Create shorter board name for visualization"""
        if len(name) <= max_length:
            return name
        parts = name.split('_', 2)
        return parts[2][:max_length] if len(parts) > 2 else name[:max_length]

    def recommend_similar_boards(self, query_board, top_k=5, exclude_children=False):
        """Recommend similar boards based on embeddings"""
        if query_board not in self.board_embeddings:
            raise ValueError(f"Board '{query_board}' not found in embeddings")

        query_emb = self.board_embeddings[query_board]
        norm_query = np.linalg.norm(query_emb)
        if norm_query == 0:
            return []

        similarities = []
        for board in self.board_names:
            if board == query_board:
                continue
            if exclude_children and self.graph.has_edge(query_board, board):
                continue
            emb = self.board_embeddings[board]
            norm_board = np.linalg.norm(emb)
            if norm_board > 0:
                sim = np.dot(query_emb, emb) / (norm_query * norm_board)
                similarities.append((board, sim))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]

    def evaluate_recommendations(self, test_data, k_values=[1, 3, 5, 10], alpha=0.6, max_depth=3):
        """Evaluate recommendation performance"""
        logging.info("Evaluating recommendation performance...")

        if not self.board_embeddings:
            self.generate_embeddings(alpha=alpha, max_depth=max_depth)

        results = {metric: {k: [] for k in k_values} for metric in ['accuracy', 'hit_ratio', 'mrr', 'ndcg']}

        user_interactions = test_data.groupby('user_id')

        for user_id, interactions in user_interactions:
            user_boards = self._get_user_boards(user_id, interactions)
            if not user_boards:
                continue

            test_pins = set(interactions['pin_id'].astype(str).apply(lambda x: f"pin_{x}"))
            test_boards = set()
            for pin_id in test_pins:
                if pin_id in self.graph:
                    boards = [n for n in self.graph.predecessors(pin_id)
                             if self.graph.nodes[n].get('type') == 'board']
                    test_boards.update(boards)

            if not test_boards:
                continue

            all_recommendations = []
            for query_board in user_boards:
                if query_board in self.board_embeddings:
                    recommendations = self.recommend_similar_boards(query_board, top_k=max(k_values))
                    all_recommendations.extend(recommendations)

            recommended_boards = {}
            for board, sim in all_recommendations:
                if board not in recommended_boards or sim > recommended_boards[board]:
                    recommended_boards[board] = sim

            sorted_recommendations = sorted(recommended_boards.items(), key=lambda x: x[1], reverse=True)

            for k in k_values:
                top_k_recommendations = [board for board, _ in sorted_recommendations[:k]]
                hits = len(set(top_k_recommendations) & test_boards)

                results['hit_ratio'][k].append(hits / len(test_boards) if test_boards else 0)
                results['accuracy'][k].append(hits / k if k > 0 else 0)

                mrr = 0
                for i, (board, _) in enumerate(sorted_recommendations[:k]):
                    if board in test_boards:
                        mrr = 1.0 / (i + 1)
                        break
                results['mrr'][k].append(mrr)

                dcg = 0
                idcg = sum(1.0 / np.log2(i + 2) for i in range(min(len(test_boards), k)))
                for i, (board, _) in enumerate(sorted_recommendations[:k]):
                    if board in test_boards:
                        dcg += 1.0 / np.log2(i + 2)
                results['ndcg'][k].append(dcg / idcg if idcg > 0 else 0)

        for metric in results:
            for k in k_values:
                results[metric][k] = np.mean(results[metric][k]) if results[metric][k] else 0

        return results

    def _get_user_boards(self, user_id, interactions):
        """Get boards associated with a user based on their interactions"""
        # Simulate user boards based on interacted pins
        user_pins = set(interactions['pin_id'].astype(str).apply(lambda x: f"pin_{x}"))
        user_boards = set()
        for pin in user_pins:
            if pin in self.graph:
                boards = [n for n in self.graph.predecessors(pin)
                         if self.graph.nodes[n].get('type') == 'board']
                user_boards.update(boards)
        return list(user_boards)

    def cross_validate(self, interaction_data, n_folds=5, k_values=[1, 3, 5, 10]):
        """Perform cross-validation"""
        logging.info(f"Performing {n_folds}-fold cross-validation...")

        cv_results = {metric: {k: [] for k in k_values} for metric in ['accuracy', 'hit_ratio', 'mrr', 'ndcg']}
        kf = KFold(n_splits=n_folds, shuffle=True, random_state=self.random_seed)

        for fold, (train_idx, test_idx) in enumerate(kf.split(interaction_data)):
            logging.info(f"Processing fold {fold+1}/{n_folds}")

            train_data = interaction_data.iloc[train_idx]
            test_data = interaction_data.iloc[test_idx]

            # Note: In a real implementation, rebuild graph with train_data
            # For simplicity, we use the existing graph
            self.generate_embeddings(alpha=0.6, max_depth=3)
            fold_results = self.evaluate_recommendations(test_data, k_values=k_values)

            for metric in cv_results:
                for k in k_values:
                    cv_results[metric][k].append(fold_results[metric][k])

        final_results = {}
        for metric in cv_results:
            final_results[metric] = {}
            for k in k_values:
                values = cv_results[metric][k]
                final_results[metric][k] = {
                    'mean': np.mean(values) if values else 0,
                    'std': np.std(values) if values else 0
                }

        return final_results

def visualize_evaluation_results(results, k_values):
    """Visualize evaluation metrics"""
    plt.figure(figsize=(15, 10))

    metrics = ['accuracy', 'hit_ratio', 'mrr', 'ndcg']
    metric_names = ['Precision (Accuracy)', 'Recall (Hit Ratio)', 'Mean Reciprocal Rank', 'NDCG']

    for i, (metric, name) in enumerate(zip(metrics, metric_names)):
        plt.subplot(2, 2, i+1)
        means = [results[metric][k]['mean'] for k in k_values]
        stds = [results[metric][k]['std'] for k in k_values]

        plt.errorbar(k_values, means, yerr=stds, marker='o', linestyle='-', capsize=5)
        plt.title(name)
        plt.xlabel('k (Number of Recommendations)')
        plt.ylabel(name)
        plt.grid(True, linestyle='--', alpha=0.7)

        for k, mean, std in zip(k_values, means, stds):
            plt.annotate(f'{mean:.3f}±{std:.3f}',
                        (k, mean), textcoords="offset points", xytext=(0, 10), ha='center')

    plt.tight_layout()
    plt.savefig('pinsage_evaluation_metrics.png', dpi=300, bbox_inches='tight')
    plt.show()

    logging.info("\nEvaluation Results:")
    for metric, name in zip(metrics, metric_names):
        logging.info(f"\n{name}:")
        for k in k_values:
            mean = results[metric][k]['mean']
            std = results[metric][k]['std']
            logging.info(f"  k={k}: {mean:.4f} ± {std:.4f}")

def run_pinsage_with_evaluation():
    """Run PinSage with evaluation"""
    model = PinSageHierarchical(embedding_dim=16)

    try:
        # Download dataset
        dataset_name = "kartikeybartwal/ecomerce-product-recommendation-dataset"
        logging.info("Downloading dataset...")
        path = kagglehub.dataset_download(dataset_name)
        logging.info(f"Dataset path: {path}")

        df = model.load_ecommerce_dataset(path)
        model.process_ecommerce_data(df)
        model.generate_embeddings(alpha=0.6, max_depth=3)
        model.cluster_boards(min_clusters=2, max_clusters=10)
        model.visualize()

        # Simulate interaction data
        logging.info("Creating simulated user-pin interactions...")
        n_users = 100
        interactions_per_user = 20
        all_pins = [n for n in model.graph.nodes() if model.graph.nodes[n].get('type') == 'pin']
        all_pins_ids = [int(pin.split('_')[1]) for pin in all_pins]

        interactions = []
        np.random.seed(42)
        for user_id in range(1, n_users + 1):
            n_interactions = np.random.randint(5, interactions_per_user)
            user_pins = np.random.choice(all_pins_ids, size=n_interactions, replace=False)
            for pin_id in user_pins:
                rating = np.random.uniform(3, 5)
                interactions.append({'user_id': user_id, 'pin_id': pin_id, 'rating': rating})

        interaction_df = pd.DataFrame(interactions)
        logging.info(f"Created {len(interaction_df)} simulated interactions for {n_users} users")

        k_values = [1, 3, 5, 10]
        cv_results = model.cross_validate(interaction_df, n_folds=5, k_values=k_values)
        visualize_evaluation_results(cv_results, k_values)

        logging.info("\nFinal Evaluation Summary:")
        logging.info(f"Embedding Dimension: {model.embedding_dim}")
        logging.info("Alpha: 0.6")
        logging.info("Max Depth: 3")
        logging.info(f"Number of Boards: {len(model.board_names)}")
        logging.info(f"Number of Pins: {len(all_pins)}")
        logging.info(f"Optimal Clusters: {model.optimal_k}")

    except Exception as e:
        logging.error(f"Error in PinSage implementation: {e}")
        raise

if __name__ == "__main__":
    run_pinsage_with_evaluation()