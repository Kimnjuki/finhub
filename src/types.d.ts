// Type declarations for Convex runtime to augment missing members
declare module "convex" {
  const defineAction: any;
  const defineQuery: any;
  const query: any;
  const mutation: any;
  const action: any;
  const defineMutation: any;
  // Add other members if needed
}

// Type declarations for Convex server module
declare module "convex/server" {
  const defineAction: any;
  const action: any;
  const defineQuery: any;
  const query: any;
  const defineMutation: any;
  const mutation: any;
  const defineSchema: any;
  const defineTable: any;
  // Add other members if needed
}

// Type declaration for react-tradingview-widget (no @types package available)
declare module 'react-tradingview-widget' {
  import { ComponentType } from 'react';

  interface TradingViewWidgetProps {
    symbol?: string;
    theme?: 'Light' | 'Dark';
    locale?: string;
    autosize?: boolean;
    hide_side_toolbar?: boolean;
    allow_symbol_change?: boolean;
    interval?: string;
    toolbar_bg?: string;
    enable_publishing?: boolean;
    hide_top_toolbar?: boolean;
    save_image?: boolean;
    container_id?: string;
    width?: number | string;
    height?: number | string;
    style?: string;
    timezone?: string;
    studies?: string[];
    show_popup_button?: boolean;
    popup_width?: number | string;
    popup_height?: number | string;
    large_chart_url?: string;
    hideideas?: boolean;
    referral_id?: string;
    widgetType?: string;
    [key: string]: any;
  }

  const TradingViewWidget: ComponentType<TradingViewWidgetProps>;
  export default TradingViewWidget;
}