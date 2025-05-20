
import MetroMap3D from "@/components/3d/MetroMap3D"; // Đường dẫn mới
// import TrainSimulator from "@/components/TrainSimulator"; // Comment out or remove old simulator

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      {/* <TrainSimulator /> */}
      <MetroMap3D />
    </div>
  );
};

export default Index;
