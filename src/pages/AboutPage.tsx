import { Setter } from "solid-js";

import Logo from "../assets/logo2.webp";
import Title from "../assets/title.png";
import HomePicto from "../assets/home_FILL0_wght400_GRAD0_opsz24.svg";

export function AboutPage(props: { setPage: Setter<string> }) {
  return (
    <div class="about">
      <h1 class="title">
        <img class="home-logo" src={Logo} />
        <img class="home-title" src={Title} />
      </h1>
      <p>
        Mobilette is a programming language + editor for recreational creative
        coding on mobile.
      </p>
      <button onClick={() => props.setPage("home")}>
        <img src={HomePicto} />
      </button>
    </div>
  );
}
