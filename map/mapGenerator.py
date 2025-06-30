import cv2
import numpy as np
import os
import shutil

def clear_folder(folder_path):
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)  # remove file or symlink
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)  # remove folder and contents
        except Exception as e:
            print(f"Failed to delete {file_path}. Reason: {e}")

def image_to_binary_array(image_path, n):
    img = cv2.imread(image_path)
    img_resized = cv2.resize(img, (int(img.shape[1]/img.shape[0]*n), n), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 127, 1, cv2.THRESH_BINARY)
    return 1- binary

def savejs(binary_map, output_dir, min_size):
    os.makedirs(output_dir, exist_ok=True)

    num_labels, labels = cv2.connectedComponents(binary_map.astype(np.uint8))
    print(f"Found {num_labels - 1} continents/islands.")

    cleaned_map = np.zeros_like(binary_map)
    
    for i in range(1, num_labels):
        component = (labels == i)
        if np.sum(component.astype(int)) < min_size: continue

        cleaned_map[component] = 1
        component = component.astype(int)

        filename = os.path.join(output_dir, f"continent{i}.js")
        with open(filename, 'w') as f:
            f.write(f"export const continent{i} = [\n")
            for r, row in enumerate(component):
                line = "  [" + ", ".join(str(val) for val in row) + "]"
                if r != len(component) - 1:
                    line += ","
                line += "\n"
                f.write(line)
            f.write("];\n")
    return cleaned_map


path = "map/japan/"
n = 100
min_continent_size = n/20
binary_map = image_to_binary_array(path+"img.jpg", n)

clear_folder(path+"continents")
binary_map = savejs(binary_map, path+"continents", min_continent_size)
cv2.imwrite(path+"img_p.jpg", binary_map * 255)
