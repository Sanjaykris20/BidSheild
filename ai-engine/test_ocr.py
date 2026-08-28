import os
os.environ['FLAGS_use_mkldnn'] = '0'
os.environ['FLAGS_enable_pir_api'] = '0'
from paddleocr import PaddleOCR
import numpy as np
import cv2

ocr = PaddleOCR(use_angle_cls=False, lang='en', use_mkldnn=False)
img = np.zeros((100, 300, 3), dtype=np.uint8)
cv2.putText(img, 'Test OCR 123', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
cv2.imwrite('test.png', img)

result = ocr.ocr('test.png')
print("TYPE:", type(result))
print("RESULT:", result)
