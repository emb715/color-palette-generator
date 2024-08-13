interface Opts {
    theme?: "dark" | "default";
    backgroundColor?: string;
}
export declare function generateColor(color: string, opts?: Opts): string[];
export declare const getContrastColor: (color: string) => "#ffffff" | "#000000";
export {};
