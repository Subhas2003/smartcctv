// src/data/HardwareArchitectureContent.jsx

export default function HardwareArchitectureContent() {
  return (
    <>
      <ul className="list-disc pl-6 space-y-4">
        <li>
          The workflow begins with the Pi Camera Module, which continuously
          captures live video from the surveillance environment. The captured
          video is divided into individual frames through the image capture
          process for further analysis.
        </li>

        <li>
          The captured frames enter the preprocessing stage, where operations
          such as resizing, format conversion, and normalization are performed
          to prepare the images for AI-based processing.
        </li>

        <li>
          Each preprocessed frame is analyzed using the YOLOv5 Object Detection
          Model, which detects objects such as people, vehicles, and other
          relevant entities present in the scene.
        </li>

        <li>
          After object detection, the Fire Detection ONNX Model processes the
          frame to identify the presence of fire. Model files and configuration
          settings such as confidence thresholds are loaded from local storage.
        </li>

        <li>
          Once detection is completed, the system annotates the frame by drawing
          bounding boxes, labels, and detection information on the video stream.
        </li>

        <li>
          The processed frame is then used for two parallel operations:
          <br />
          • Live Video Streaming using Flask MJPEG Stream
          <br />
          • Video Recording using OpenCV VideoWriter
        </li>

        <li>
          Recorded videos are automatically stored as 5-minute MP4 segments,
          enabling efficient storage management and easier retrieval of
          surveillance footage.
        </li>

        <li>
          After a recording segment is completed, the system uploads the video
          file to Amazon AWS S3 Cloud Storage for secure and reliable storage.
        </li>

        <li>
          If the upload is successful, the local video file is automatically
          deleted from the Raspberry Pi to free storage space and optimize
          system performance.
        </li>

        <li>
          This workflow provides real-time AI-based object and fire detection,
          live video streaming, automated recording, cloud storage integration,
          and centralized surveillance management through the web dashboard.
        </li>
      </ul>
    </>
  );
}