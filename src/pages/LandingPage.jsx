import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const VERTICALS = [
  {
    id: "stay",
    title: "Stay / Accommodation",
    subtitle:
      "Hotels, resorts, villas, homestays, apartments & hostels",
    icon: "⌂",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "bus",
    title: "Bus",
    subtitle:
      "Bus operators & fleet owners — intercity, tourist, contract",
    icon: "▣",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cab",
    title: "Cab / Car Rental / Transfers",
    subtitle:
      "Taxi, chauffeur, airport transfers, car rentals",
    icon: "◉",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "packages",
    title: "Tour / Holiday Packages",
    subtitle:
      "Tour operators, DMCs, group and private holiday packages",
    icon: "♙",
    image:
      "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "activities",
    title: "Activities / Experiences",
    subtitle:
      "Attractions, adventures, guided experiences",
    icon: "◇",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "events",
    title: "Events / Nightlife",
    subtitle:
      "Concerts, festivals, clubs, entertainment venues",
    icon: "♪",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "darshan",
    title: "Darshan / Religious",
    subtitle:
      "Temples, trusts, pilgrimage, puja & special access",
    icon: "♜",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "cruise",
    title: "Cruise",
    subtitle:
      "Ocean, river, yacht & charter cruise operators",
    icon: "≈",
    image:
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=900&q=85",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const goSignup = (vertical = "") => {
    if (vertical) {
      localStorage.setItem("selectedVertical", vertical);
      navigate(`/signup?vertical=${vertical}`);
    } else {
      navigate("/signup");
    }
  };

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lp-page">
      <header className="lp-nav">
        <button
          className="lp-brand"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <span className="lp-brand-mark">B</span>

          <span className="lp-brand-name">
            <b>BMT</b>
            <em>Connect</em>
          </span>
        </button>

        <nav className="lp-links">
          <button onClick={() => scrollTo("verticals")}>
            Verticals
          </button>

          <button onClick={() => scrollTo("why")}>
            Why partner
          </button>

          <button onClick={() => scrollTo("how")}>
            How it works
          </button>
        </nav>

        <div className="lp-actions">
          <button
            className="lp-signin"
            onClick={() => navigate("/signin")}
          >
            Sign in
          </button>

          <button
            className="lp-list"
            onClick={() => goSignup()}
          >
            List your business →
          </button>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-overlay" />

        <div className="lp-hero-inner">
          <span className="lp-kicker">
            BIRDMYTRIP • TRAVEL COMMERCE INFRASTRUCTURE
          </span>

          <h1>
            List your travel business
            <br />
            globally,
            <br />
            grow with a single supplier
            <br />
            platform.
          </h1>

          <p>
            Manage stays, transport, tours, activities,
            events, darshan and cruises from one
            professional extranet — with verified
            onboarding, payouts and analytics built for
            scale.
          </p>

          <div className="lp-hero-buttons">
            <button
              className="lp-primary"
              onClick={() => goSignup()}
            >
              Start free application →
            </button>

            <button
              className="lp-secondary"
              onClick={() => navigate("/signin")}
            >
              Sign in to your account
            </button>
          </div>

          <div className="lp-stats">
            <div>
              <strong>8</strong>
              <span>Verticals supported</span>
            </div>

            <div>
              <strong>50+</strong>
              <span>Countries</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Partner support</span>
            </div>

            <div>
              <strong>T+2</strong>
              <span>Payout SLA</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="verticals"
        className="lp-section"
      >
        <div className="lp-section-top">
          <div>
            <span className="lp-small-kicker">
              AVAILABLE BUSINESSES
            </span>

            <h2>
              List any of these travel businesses
            </h2>
          </div>

          <p>
            Pick your business type during onboarding.
            The registration adapts to your vertical —
            documents, product setup, payouts and dashboard.
          </p>
        </div>

        <div className="lp-vertical-grid">
          {VERTICALS.map((v) => (
            <button
              key={v.id}
              className="lp-vertical-card"
              onClick={() => goSignup(v.id)}
            >
              <img
                src={v.image}
                alt={v.title}
              />

              <div className="lp-card-body">
                <h3>
                  <span>{v.icon}</span>
                  {v.title}
                </h3>

                <p>{v.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section
        id="why"
        className="lp-feature-strip"
      >
        <div>
          <span>◎</span>
          <h3>Global reach</h3>
          <p>
            Sell across BirdMyTrip channels with localized
            currency, tax and payout.
          </p>
        </div>

        <div>
          <span>◈</span>
          <h3>Verified & compliant</h3>
          <p>
            Country-aware KYC, document verification and
            expiry monitoring built-in.
          </p>
        </div>

        <div>
          <span>ϟ</span>
          <h3>Built for scale</h3>
          <p>
            From single-property owners to multi-vertical
            DMCs — dashboards adapt automatically.
          </p>
        </div>
      </section>

      <section
        id="how"
        className="lp-section lp-how"
      >
        <span className="lp-small-kicker">
          PLATFORM ONBOARDING
        </span>

        <h2>
          Join in 4 simple steps
        </h2>

        <div className="lp-how-grid">
          <div>
            <b>01</b>
            <h3>Apply for entry</h3>
            <p>Account + basic business details</p>
          </div>

          <div>
            <b>02</b>
            <h3>Application review</h3>
            <p>KYC and verification checks</p>
          </div>

          <div>
            <b>03</b>
            <h3>Contract signing</h3>
            <p>Commercial and payout setup</p>
          </div>

          <div>
            <b>04</b>
            <h3>Success!</h3>
            <p>Your business goes live</p>
          </div>
        </div>
      </section>
    </div>
  );
}