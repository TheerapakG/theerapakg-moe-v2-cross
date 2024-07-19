const formatter = Intl.NumberFormat("en", { notation: "compact" });

export const formatPretty = formatter.format;
