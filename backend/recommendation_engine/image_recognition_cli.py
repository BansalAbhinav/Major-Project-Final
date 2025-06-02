import argparse
import json
from image_recognition import get_model

def main():
    parser = argparse.ArgumentParser(description='Find similar images using content-based image retrieval')
    parser.add_argument('--image_path', required=True, help='Path to the query image')
    parser.add_argument('--num_results', type=int, default=5, help='Number of similar images to return')
    args = parser.parse_args()

    # Get model and find similar images
    model = get_model()
    results = model.find_similar_images(args.image_path, args.num_results)

    # Print results as JSON
    print(json.dumps(results))

if __name__ == '__main__':
    main() 