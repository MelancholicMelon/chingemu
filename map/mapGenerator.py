import cv2
import numpy as np
import os
import shutil

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

def image_to_binary_array(image_path, n):
    img = cv2.imread(image_path)
    img_resized = cv2.resize(img, (int(img.shape[1]/img.shape[0]*n), n), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 127, 1, cv2.THRESH_BINARY)
    return 1- binary

def savejs(binary_map, output_file, min_size):
    num_labels, labels = cv2.connectedComponents(binary_map.astype(np.uint8))
    print(f"Found {num_labels - 1} total components.")

    continent_index = 1
    cleaned_map = np.zeros_like(binary_map)
    names = []

    with open(output_file, 'w') as f:
        for i in range(1, num_labels):
            component_mask = (labels == i)
            pixel_count = np.sum(component_mask)
            if pixel_count < min_size:
                continue

            cleaned_map[component_mask] = 1
            name = f"continent{continent_index}"
            names.append(name)

            f.write(f"export const {name} = [\n")
            for r, row in enumerate(component_mask.astype(int)):
                line = "  [" + ", ".join(str(val) for val in row) + "]"
                if r != len(component_mask) - 1:
                    line += ","
                line += "\n"
                f.write(line)
            f.write("];\n\n")
            continent_index += 1

        # Export combined list and map
        list_line = "export const allContinents = [" + ", ".join(names) + "];\n"
        map_line = "export const continentMap = {\n" + "".join([f"  {n},\n" for n in names]) + "};\n"

        f.write(list_line)
        f.write("\n")
        f.write(map_line)

    return cleaned_map



paths = [
    "map/japan/",
    "map/world/"
]
n = 500
min_continent_size = n/20

for path in paths:
    binary_map = image_to_binary_array(path+"img.jpg", n)
    clear_folder(path+"continents")
    binary_map = savejs(binary_map, path+"continents.js", min_continent_size)
    cv2.imwrite(path+"img_p.jpg", binary_map * 255)
