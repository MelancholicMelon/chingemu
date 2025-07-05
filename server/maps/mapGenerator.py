import cv2
import numpy as np
import os
import shutil
import json

def clear_folder(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        return
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  # remove file or symlink
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)  # remove folder and contents
        except Exception as e:
            print(f"Failed to delete {file_path}. Reason: {e}")

def edge_aware_erosion(image, iternation, erosion_value=0):
    """
    Erodes only the edge pixels of non-zero regions (grayscale).
    A pixel is eroded (set to erosion_value) if it has any zero-valued neighbor.
    """
    if iternation == 0: return image
    # Create a mask of non-zero pixels
    mask = (image > 0).astype(np.uint8)

    # Dilate the zero region to find neighbors of 0
    zero_neighbors = cv2.dilate((image == 0).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1)

    # Edge pixels are non-zero pixels that touch zero
    edge_mask = np.logical_and(mask, zero_neighbors)

    # Apply erosion: set edge pixels to erosion_value
    eroded_image = image.copy()
    eroded_image[edge_mask] = erosion_value
    return edge_aware_erosion(eroded_image, iternation-1)

def processImage(image_path, n, erosion_iterations=3):
    # Read image and convert to grayscale
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.int32)

    # Invert grayscale (bright areas become dark and vice versa)
    gray = 255 - gray

    # Shift min non-zero value to 0 (keep 0 as background)
    non_zero = gray[gray > 0]
    if non_zero.size > 0:
        min_val = non_zero.min()
        gray = np.where(gray > 0, gray - min_val, 0)
    gray = gray/np.max(gray)*255

    # Convert to uint8 for morphological operations
    gray = gray.astype(np.uint8)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)

    # Apply morphological erosion (corrosion)
    #kernel = np.ones((erosion_kernel_size, erosion_kernel_size), np.uint8)
    eroded = edge_aware_erosion(gray, erosion_iterations)
    #eroded = cv2.erode(gray, kernel, iterations=erosion_iterations)

    # Resize after erosion (preserve outline shape better)
    aspect_ratio = img.shape[1] / img.shape[0]
    new_width = int(aspect_ratio * n)
    resized = cv2.resize(eroded, (new_width, n), interpolation=cv2.INTER_AREA)
    _, binary = cv2.threshold(resized, 1, 1, cv2.THRESH_BINARY)

    return resized, binary, eroded


def savejs(map, binary, output_file, min_size):
    # Create binary mask: non-zero pixels considered "land"
    num_labels, labels = cv2.connectedComponents(binary.astype(np.uint8))

    print(f"Found {num_labels - 1} total components.")

    cleaned_grayscale = np.zeros_like(map, dtype=np.uint8)
    continent_index = 1
    names = []

    with open(output_file, 'w') as f:
        for i in range(1, num_labels):
            mask = (labels == i)
            pixel_count = np.sum(mask)
            if pixel_count < min_size:
                continue

            # Apply mask to grayscale map
            component = np.where(mask, map, 0)

            # Add to cleaned grayscale map
            cleaned_grayscale = np.where(mask, map, cleaned_grayscale)

            # Export to JS
            name = f"continent{continent_index}"
            names.append(name)

            f.write(f"export const {name} = [\n")
            for r, row in enumerate(component):
                line = "  [" + ", ".join(str(int(val)) for val in row) + "]"
                if r != len(component) - 1:
                    line += ","
                line += "\n"
                f.write(line)
            f.write("];\n\n")

            continent_index += 1

        f.write("export const allContinents = [" + ", ".join(names) + "];\n")
        f.write("export const continentMap = {\n" + "".join([f"  {n},\n" for n in names]) + "};\n")

    return cleaned_grayscale

def savejson(map, binary, output_file, min_size):
    # Label connected components
    num_labels, labels = cv2.connectedComponents(binary.astype(np.uint8))
    print(f"Found {num_labels - 1} total components.")

    cleaned_grayscale = np.zeros_like(map, dtype=np.uint8)
    continents = []

    continent_index = 1
    for i in range(1, num_labels):  # skip background label 0
        mask = (labels == i)
        pixel_count = np.sum(mask)

        if pixel_count < min_size:
            continue

        # Extract grayscale values for this continent
        component = np.where(mask, map, 0)
        cleaned_grayscale = np.where(mask, map, cleaned_grayscale)

        continents.append({
            "id": f"{continent_index}",
            "size": int(pixel_count),
            "kernel": component.tolist()  # Convert NumPy array to nested list
        })

        continent_index += 1

    # Write all continents to one JSON file
    with open(output_file, 'w') as f:
        json.dump(continents, f, indent=2)

    print(f"Saved {continent_index - 1} continents to {output_file}")
    return cleaned_grayscale

paths = [
    "maps/world/",
    "maps/japan/",
    "maps/northAmerica/",
    "maps/indonesia/",
    "maps/shikoku/"
]
eP = [10, 10, 10, 10, 12]
n = 150
min_continent_size = n/10

for i, path in enumerate(paths):
    map, binary, eroded = processImage(path+"img.jpg", n, eP[i])
    map = savejs(map, binary, path+"continents.js", min_continent_size)
    map = savejson(map, binary, path+"continents.json", min_continent_size)
    cv2.imwrite(path+"img_p.jpg", map)
    cv2.imwrite(path+"img_b.jpg", binary*255)
    cv2.imwrite(path+"img_e.jpg", eroded)
