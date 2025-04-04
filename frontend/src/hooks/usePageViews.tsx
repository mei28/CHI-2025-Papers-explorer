import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageViews = () => {
  const location = useLocation();

  useEffect(() => {
    // GA4用の gtag コマンドでページビューを送信
    window.gtag("config", "G-XXXXXXXXXX", {
      page_path: location.pathname,
    });
  }, [location]);
};

export default usePageViews;
