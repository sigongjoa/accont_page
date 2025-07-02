import tkinter as tk
from tkinter import filedialog, messagebox
import os

class PaperUploaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Paper Data Uploader")
        self.root.geometry("500x250")
        self.root.resizable(False, False)

        # File path variable
        self.file_path = tk.StringVar()
        self.file_path.set("No file selected")

        # UI Elements
        self.create_widgets()

    def create_widgets(self):
        # Title
        title_label = tk.Label(self.root, text="Upload Paper Data", font=("Arial", 16, "bold"))
        title_label.pack(pady=20)

        # File selection frame
        file_frame = tk.Frame(self.root)
        file_frame.pack(pady=10)

        self.path_label = tk.Label(file_frame, textvariable=self.file_path, width=40, relief="groove", borderwidth=1)
        self.path_label.pack(side=tk.LEFT, padx=5)

        browse_button = tk.Button(file_frame, text="Browse", command=self.browse_file)
        browse_button.pack(side=tk.RIGHT, padx=5)

        # Upload button
        upload_button = tk.Button(self.root, text="Upload Data", command=self.upload_file, font=("Arial", 12), bg="#4CAF50", fg="white")
        upload_button.pack(pady=20)

        # Status message
        self.status_label = tk.Label(self.root, text="", fg="blue")
        self.status_label.pack(pady=5)

    def browse_file(self):
        filetypes = [("JSON files", "*.json"), ("All files", "*.*")]
        filepath = filedialog.askopenfilename(title="Select Paper Data File", filetypes=filetypes)
        if filepath:
            self.file_path.set(filepath)
            self.status_label.config(text=f"File selected: {os.path.basename(filepath)}", fg="blue")
        else:
            self.file_path.set("No file selected")
            self.status_label.config(text="File selection cancelled.", fg="orange")

    def upload_file(self):
        selected_file = self.file_path.get()
        if selected_file == "No file selected" or not os.path.exists(selected_file):
            messagebox.showwarning("No File", "Please select a file first.")
            self.status_label.config(text="Upload failed: No file selected.", fg="red")
            return

        self.status_label.config(text="Uploading...", fg="purple")
        self.root.update_idletasks() # Update GUI to show 'Uploading...'

        try:
            # --- 실제 파일 업로드 로직을 여기에 구현하세요 ---
            # 예시: 파일을 읽어서 처리하거나, 외부 API로 전송하는 코드
            # with open(selected_file, 'r', encoding='utf-8') as f:
            #     file_content = f.read()
            #     print(f"Simulating upload of: {selected_file}")
            #     print(f"Content snippet: {file_content[:100]}...")

            # 실제로는 requests 라이브러리 등을 사용하여 서버로 파일을 전송할 수 있습니다.
            # import requests
            # url = "http://your-backend-api.com/upload"
            # files = {'file': open(selected_file, 'rb')}
            # response = requests.post(url, files=files)
            # if response.status_code == 200:
            #     messagebox.showinfo("Success", "File uploaded successfully!")
            #     self.status_label.config(text="Upload successful!", fg="green")
            # else:
            #     messagebox.showerror("Error", f"Upload failed: {response.status_code} - {response.text}")
            #     self.status_label.config(text="Upload failed.", fg="red")

            # 시뮬레이션 (성공 가정)
            import time
            time.sleep(2) # Simulate network delay
            messagebox.showinfo("Success", "File upload simulated successfully!")
            self.status_label.config(text="Upload successful! (Simulated)", fg="green")

        except Exception as e:
            messagebox.showerror("Error", f"An error occurred during upload: {e}")
            self.status_label.config(text=f"Upload failed: {e}", fg="red")


if __name__ == "__main__":
    root = tk.Tk()
    app = PaperUploaderApp(root)
    root.mainloop()
