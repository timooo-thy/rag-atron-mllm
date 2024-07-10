const BouncingDotsLoader = () => {
  return (
    <div className="flex justify-center">
      <div className="w-2 h-2 mx-[3px] my-[6px] bg-primary opacity-1 rounded-[50%] animate-bouncing-loader"></div>
      <div className="w-2 h-2 mx-[3px] my-[6px] bg-primary opacity-1 rounded-[50%] animate-bouncing-loader animation-delay-200"></div>
      <div className="w-2 h-2 mx-[3px] my-[6px] bg-primary opacity-1 rounded-[50%] animate-bouncing-loader animation-delay-400"></div>
    </div>
  );
};

export default BouncingDotsLoader;
