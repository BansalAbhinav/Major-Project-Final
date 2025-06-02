# Product Recommendation Engine

This Python-based recommendation engine is integrated into our e-commerce platform to provide intelligent product recommendations and analytics.

## Features

1. **Similar Products Recommendation**
   - Uses cosine similarity to find similar products
   - Considers multiple features: price, rating, and sales count
   - Normalizes data for better comparison

2. **Trending Products Analysis**
   - Calculates trending score based on sales and ratings
   - Weighted algorithm: 70% sales + 30% ratings
   - Returns top N trending products

3. **Category Distribution Analysis**
   - Analyzes product distribution across categories
   - Provides data for dashboard visualization
   - Helps in inventory management

## Integration with Dashboard

The recommendation engine provides data for several dashboard components:
- Top Products Chart
- Product Categories Distribution
- Related Products Suggestions

## Technical Details

### Dependencies
- pandas: Data manipulation and analysis
- numpy: Numerical computations
- scikit-learn: Machine learning algorithms

### Installation
```bash
cd backend/recommendation_engine
pip install -r requirements.txt
```

### Usage
```python
from product_recommender import ProductRecommender

# Initialize recommender
recommender = ProductRecommender()

# Get similar products
similar_products = recommender.get_similar_products(product_id=1)

# Get trending products
trending_products = recommender.get_trending_products()

# Get category distribution
category_dist = recommender.get_category_distribution()
```

## Machine Learning Components

1. **Feature Engineering**
   - Standardization of numerical features
   - Multi-feature similarity calculation

2. **Similarity Calculation**
   - Uses cosine similarity from scikit-learn
   - Considers multiple product attributes

3. **Trend Analysis**
   - Custom scoring algorithm
   - Weighted combination of metrics 