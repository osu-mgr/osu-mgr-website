import * as React from "react";
import GlobalData from "../../content/global/index.json";

const ThemeContext = React.createContext(GlobalData.theme);

export const useTheme = () => React.useContext(ThemeContext);

const getUserSystemDarkMode = () => {
  if (typeof window !== "undefined") {
    const userMedia = window.matchMedia("(prefers-color-scheme: dark)");

    if (userMedia.matches) {
      return "dark";
    }
  }

  return "light";
};

export const Theme = ({ data, children }) => {
  const [systemDarkMode, setSystemDarkMode] = React.useState(
    getUserSystemDarkMode()
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userMedia = window.matchMedia("(prefers-color-scheme: dark)");

      const updateSystemMediaPreference = (event) => {
        setSystemDarkMode(event.matches ? "dark" : "light");
      };

      userMedia.addEventListener("change", updateSystemMediaPreference);

      return () =>
        userMedia.removeEventListener("change", updateSystemMediaPreference);
    }
    return;
  }, [setSystemDarkMode]);

  const { color = "blue" } = data;

  return (
    <ThemeContext.Provider
      value={{
        color,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
