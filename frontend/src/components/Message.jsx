const Message = ({ variant, children }) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 text-green-800 border border-green-200";
      case "error":
        return "bg-red-50 text-red-800 border border-red-200";
      default:
        return "bg-blue-50 text-blue-800 border border-blue-200";
    }
  };

  return <div className={`p-4 rounded-lg ${getVariantClass()}`}>{children}</div>;
};

export default Message;
