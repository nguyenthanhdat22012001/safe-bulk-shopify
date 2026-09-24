import * as React from "react";

// Dành cho React phiên bản mới (sử dụng react-jsx)
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
