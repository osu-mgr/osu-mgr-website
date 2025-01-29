import React from "react";

export const Container = ({
  children,
  width = "large",
  className = "",
  ...props
}) => {
  const widthClass = {
    small: "max-w-4xl",
    medium: "max-w-5xl",
    large: "max-w-7xl",
    custom: "",
  };

  return (
    <div
      className={`${widthClass[width]} mx-auto px-6 sm:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
