import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import json
import os
from tqdm import tqdm

def main():
    # Load pre-trained model
    model = models.resnet18(pretrained=True)
    model = nn.Sequential(*list(model.children())[:-1])
    model.eval()

    # Image preprocessing
    transform = transforms.Compose([
        transforms.Resize(224),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                          std=[0.229, 0.224, 0.225])
    ])

    # Load image paths and labels from the dataset
    data_dir = os.path.join(os.path.dirname(__file__), 'img')
    if not os.path.exists(data_dir):
        print(f"Creating image directory: {data_dir}")
        os.makedirs(data_dir)
        print("Please add your training images to the 'img' directory")
        print("Images should be organized in subdirectories by category")
        print("Example: img/jeans/image1.jpg, img/dresses/image2.jpg")
        return

    image_paths = []
    labels = []

    # Walk through the image directory
    print("Scanning image directory...")
    for root, _, files in os.walk(data_dir):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                image_paths.append(os.path.join(root, file))
                labels.append(os.path.basename(root).replace('_', ' '))

    if not image_paths:
        print("No images found in the 'img' directory")
        print("Please add your training images and try again")
        return

    print(f"Found {len(image_paths)} images in {len(set(labels))} categories")

    # Generate embeddings
    embeddings = []
    failed_images = []
    print("Generating embeddings...")
    for image_path in tqdm(image_paths):
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image = transform(image)
            image = image.unsqueeze(0)  # Add batch dimension

            # Get embedding
            with torch.no_grad():
                embedding = model(image)
            embedding = embedding.squeeze().numpy()
            embeddings.append(embedding.tolist())  # Convert to list for JSON serialization
        except Exception as e:
            print(f"\nError processing {image_path}: {e}")
            failed_images.append(image_path)
            # Remove the failed image from our dataset
            idx = image_paths.index(image_path)
            image_paths.pop(idx)
            labels.pop(idx)
            continue

    if failed_images:
        print(f"\nFailed to process {len(failed_images)} images:")
        for path in failed_images:
            print(f"  - {path}")

    # Save embeddings to JSON
    print("\nSaving embeddings...")
    data = {
        'embeddings': embeddings,
        'image_paths': image_paths,
        'labels': labels
    }

    output_path = os.path.join(os.path.dirname(__file__), 'embeddings.json')
    with open(output_path, 'w') as f:
        json.dump(data, f)

    print(f"Successfully saved embeddings for {len(embeddings)} images to {output_path}")

if __name__ == '__main__':
    main() 