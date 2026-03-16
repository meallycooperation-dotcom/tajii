import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-2BBMYXGF9N");
};

export const trackPageView = (page) => {
  ReactGA.send({
    hitType: "pageview",
    page: page,
  });
};