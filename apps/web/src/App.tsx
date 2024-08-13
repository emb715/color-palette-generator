import { useCallback, useState } from "react";
import "./App.css";
import { generateColor, getContrastColor } from "color-generator";
import { HexColorInput, HexColorPicker } from "react-colorful";

const defaultColors = {
  main: "#b32aa9",
  backgroundLight: "#fff",
  backgroundDark: "#111",
};

type GeneratedPalette = { light: string[]; dark: string[] };
function getColors(
  color: string,
  options?: { bgLight: string; bgDark: string }
): GeneratedPalette {
  const defaultColor = generateColor(color, {
    backgroundColor: options?.bgLight ?? defaultColors.backgroundLight,
  });
  const darkColor = generateColor(color, {
    theme: "dark",
    backgroundColor: options?.bgDark ?? defaultColors.backgroundDark,
  });
  return {
    light: defaultColor,
    dark: darkColor,
  };
}

type SavedPalettes = Record<
  string,
  {
    color: string;
    palette: GeneratedPalette;
    bgLight: string;
    bgDark: string;
  }
>;

function App() {
  const [color, setColor] = useState<string>(defaultColors.main);

  const [backgroundColor, setBackgroundColor] = useState<string>(
    defaultColors.backgroundLight
  );
  const [backgroundColorDark, setBackgroundColorDark] = useState<string>(
    defaultColors.backgroundDark
  );
  const [palettes, setPalettes] = useState<SavedPalettes>();

  const getColorKey = useCallback(
    (currentColor: string) => {
      return `${currentColor.toUpperCase()}-${backgroundColor.toUpperCase()}-${backgroundColorDark.toUpperCase()}`;
    },
    [backgroundColor, backgroundColorDark]
  );

  const onGenerate = useCallback(
    (currentColor: string) => {
      const colorKey = getColorKey(currentColor);
      if (palettes && Object.keys(palettes).includes(colorKey)) {
        document.getElementById(colorKey)?.scrollIntoView({
          behavior: "auto",
        });
        return;
      }

      const newPalettes = getColors(currentColor, {
        bgLight: backgroundColor,
        bgDark: backgroundColorDark,
      });

      setPalettes((prev) => ({
        ...prev,
        [colorKey]: {
          color: currentColor,
          palette: newPalettes,
          bgLight: backgroundColor,
          bgDark: backgroundColorDark,
        },
      }));
    },
    [backgroundColor, backgroundColorDark, getColorKey, palettes]
  );

  const copyToClipboard = useCallback(async (string: string) => {
    try {
      await navigator.clipboard.writeText(string);
      // TODO: show Toast
      console.log("copyToClipboard:", string);
    } catch (error) {
      console.log("Error: copyToClipboard", error);
    }
  }, []);

  return (
    <>
      <div className="container">
        <span className="muted">Light &amp; Dark Color Mode</span>
        <h1 style={{ margin: 0 }}>Color Palette Generator</h1>
        <h2>Chose a base color</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="flex">
            <div>
              <HexColorPicker color={color} onChange={setColor} />
              <div style={{ marginTop: "1rem" }}>
                <HexColorInput
                  name="color"
                  prefixed
                  color={color}
                  onChange={setColor}
                />
              </div>
            </div>
            <div className="card">
              <h4>Background</h4>
              <div>
                <label className="muted">Light </label>
                <HexColorInput
                  name="background-light"
                  prefixed
                  color={backgroundColor.toUpperCase()}
                  onChange={setBackgroundColor}
                  size={8}
                />
              </div>
              <div>
                <label className="muted">Dark </label>
                <HexColorInput
                  name="background-dark"
                  prefixed
                  color={backgroundColorDark.toUpperCase()}
                  onChange={setBackgroundColorDark}
                  size={8}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <button onClick={() => onGenerate(color)}>Generate</button>
        </div>

        {palettes && (
          <div className="palettes">
            {Object.entries(palettes)
              .reverse()
              .map(
                ([colorKey, { palette, bgLight, bgDark, color: _color }]) => (
                  <div className="palettes-block" key={colorKey}>
                    <div
                      className={`palette-color ${
                        colorKey === getColorKey(color)
                          ? "palette-color--selected"
                          : ""
                      }`}
                      id={colorKey}
                    >
                      {_color}
                    </div>

                    <div className="palettes-container">
                      <div key={`${colorKey}-${_color}`}>
                        <div
                          key={`${colorKey}-${_color}-light`}
                          className="palette palette--light"
                          style={{
                            backgroundColor: bgLight,
                          }}
                        >
                          <div
                            className="flex"
                            style={{ justifyContent: "space-between" }}
                          >
                            {palette.light.map((c, index) => (
                              <button
                                key={`${colorKey}-${_color}-light-${c}-${index}`}
                                style={{ backgroundColor: c }}
                                className="button-color"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  copyToClipboard(c);
                                }}
                                data-index={index}
                                data-color={c}
                              >
                                <div className="clipboard">COPY</div>
                                <span style={{ color: getContrastColor(c) }}>
                                  {c}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            className="button-code"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              copyToClipboard(JSON.stringify(palette.light));
                            }}
                          >
                            <span className="clipboard">COPY</span>
                            {palettes && JSON.stringify(palette.light)}
                          </button>
                        </div>
                        <div
                          key={`${colorKey}-${_color}-dark`}
                          className="palette palette--dark"
                          style={{
                            backgroundColor: bgDark,
                          }}
                        >
                          <div
                            className="flex"
                            style={{ justifyContent: "space-between" }}
                          >
                            {palette.dark.map((c, index) => (
                              <button
                                key={`${colorKey}-${_color}-dark-${c}-${index}`}
                                style={{ backgroundColor: c }}
                                className="button-color"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  copyToClipboard(c);
                                }}
                                data-index={index}
                                data-color={c}
                              >
                                <span className="clipboard">COPY</span>
                                <span style={{ color: getContrastColor(c) }}>
                                  {c}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            className="button-code"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              copyToClipboard(JSON.stringify(palette.dark));
                            }}
                          >
                            <span className="clipboard">COPY</span>
                            {palettes && JSON.stringify(palette.dark)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
          </div>
        )}
      </div>
      <code
        style={{
          marginTop: "2rem",
          alignSelf: "flex-start",
        }}
      >
        by EMB
      </code>
    </>
  );
}

export default App;