import React from "react"
import { render, screen } from "@testing-library/react"
import Card from "./Card"

describe("Card", () => {
  it("renders card information", () => {
    const mockCard = {
      name: "Test Card",
      rarity: "Common",
      price: 10.99
    }

    render(<Card card={mockCard} />)
    
    expect(screen.getByText("Test Card")).toBeInTheDocument()
    expect(screen.getByText("Common")).toBeInTheDocument()
    expect(screen.getByText("$10.99")).toBeInTheDocument()
  })
})
