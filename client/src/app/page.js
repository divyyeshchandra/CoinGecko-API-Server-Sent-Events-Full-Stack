"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [coinData, setCoinData] = useState([]);

  const formatPrice = (value, decimalPlaces) => {
    const roundedValue = Number(value.toFixed(decimalPlaces));
    return roundedValue;
  };

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/events");

    // Event listener for incoming messages
    eventSource.onmessage = (event) => {
      console.log("calling");
      const eventData = JSON.parse(event.data);
      setCoinData(eventData);
    };

    // Event listener for errors
    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    // Clean up on component unmount
    return () => {
      eventSource.close();
    };
  }, []); // Empty dependency array to run effect only once

  return (
    <main className={styles.main}>
      <div style={{ marginTop: "5rem", textAlign: "center" }}>
        <h1>Latest Price From CoinMarketCap</h1>
        <h2 style={{ marginTop: "1rem" }}>
          Connection Status:{" "}
          <span style={{ fontWeight: 500, gap: 2, color: "green" }}>
            Connection Established
          </span>
        </h2>
        <h2 style={{ marginTop: "1rem" }}>
          Latest Price BTC: <span style={{ fontWeight: 200 }}>$27691</span>
        </h2>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "5rem",
          padding: "1rem",
          width: "50rem",
          borderRadius: "20px",
          backgroundColor: "lightgrey",
          margin: "auto",
        }}
      >
        {coinData.map((coin) => (
          <div
            key={coin.id}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              margin: "1rem",
              padding: "1rem 2rem",
              border: "1px solid #000000",
              borderRadius: "8px",
              width: "100%",
              boxSizing: "border-box",
              justifyContent: "space-evenly",
              padding: "1rem 5rem",
            }}
          >
            <Image width={45} height={45} src={coin.image} alt="Image" />
            <div style={{ marginLeft: "1rem", flex: 1 }}>
              <h3 style={{ color: "black" }}>{`Symbol: ${coin.symbol}`}</h3>
              <h3 style={{ color: "black" }}>{`Token: ${coin.name}`}</h3>
            </div>
            <h3 style={{ marginLeft: "1rem", color: "black" }}>{`$${formatPrice(
              coin.current_price,
              4
            )}`}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}
