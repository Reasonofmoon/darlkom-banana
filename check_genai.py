import google.generativeai as genai
try:
    print(f"Version: {genai.__version__}")
    print(f"Has ImageGenerationModel: {hasattr(genai, 'ImageGenerationModel')}")
except Exception as e:
    print(f"Error checking: {e}")
