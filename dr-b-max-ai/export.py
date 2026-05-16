import torch
from model import PhysNet
import onnx
from onnx_tf.backend import prepare
import tensorflow as tf

def export_to_tflite():
    """
    Converts the PyTorch PhysNet model to TensorFlow Lite for Mobile Edge Deployment.
    Pipeline: PyTorch (.pth) -> ONNX (.onnx) -> TensorFlow SavedModel -> TFLite (.tflite)
    """
    model_path = "physnet_final.pth" # Replace with actual trained checkpoint
    
    # 1. Load PyTorch Model
    model = PhysNet(frames=128)
    # model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    
    # 2. Export to ONNX
    dummy_input = torch.randn(1, 3, 128, 64, 64)
    onnx_path = "physnet.onnx"
    torch.onnx.export(model, dummy_input, onnx_path, 
                      export_params=True, 
                      opset_version=11, 
                      input_names=['video_input'], 
                      output_names=['pulse_wave'])
    print(f"Exported ONNX model to {onnx_path}")
    
    # 3. Convert ONNX to TF SavedModel
    # Note: Requires onnx-tf package: pip install onnx-tf
    onnx_model = onnx.load(onnx_path)
    tf_rep = prepare(onnx_model)
    tf_model_path = "physnet_tf"
    tf_rep.export_graph(tf_model_path)
    print(f"Exported TF SavedModel to {tf_model_path}")
    
    # 4. Convert to TFLite
    converter = tf.lite.TFLiteConverter.from_saved_model(tf_model_path)
    
    # Optional: Enable quantization for smaller size and faster inference
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    tflite_model = converter.convert()
    
    tflite_path = "rppg_model.tflite"
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
        
    print(f"Successfully exported highly compressed TFLite model to {tflite_path}")
    print("Drop this file into dr-b-max-mobile/assets/")

if __name__ == "__main__":
    export_to_tflite()
