/**
 * Component Tests
 *
 * Tests for React components using React Testing Library
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Components to test
import { ChatMessage } from "@/components/chat/ChatMessage";
import { InputBox } from "@/components/chat/InputBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Types
import type { CrawlMessage } from "@/types";

// =============================================================================
// ChatMessage Component Tests
// =============================================================================

describe("ChatMessage", () => {
  const mockUserMessage: CrawlMessage = {
    id: "msg-1",
    type: "user",
    content: "https://example.com",
    timestamp: new Date("2024-12-31T10:00:00Z"),
    websiteUrl: "https://example.com",
  };

  const mockSystemMessage: CrawlMessage = {
    id: "msg-2",
    type: "system",
    content: "Analysis complete! Found 150 pages.",
    timestamp: new Date("2024-12-31T10:01:00Z"),
  };

  const mockStatusMessage: CrawlMessage = {
    id: "msg-3",
    type: "status",
    content: "Analyzing website...",
    timestamp: new Date("2024-12-31T10:00:30Z"),
    status: "crawling",
    crawlProgress: 45,
  };

  it("should render user message correctly", () => {
    render(<ChatMessage message={mockUserMessage} />);
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  it("should render system message correctly", () => {
    render(<ChatMessage message={mockSystemMessage} />);
    expect(
      screen.getByText("Analysis complete! Found 150 pages.")
    ).toBeInTheDocument();
  });

  it("should render status message with progress", () => {
    render(<ChatMessage message={mockStatusMessage} />);
    expect(screen.getByText("Analyzing website...")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("should have data-testid attribute", () => {
    render(<ChatMessage message={mockUserMessage} />);
    expect(screen.getByTestId("chat-message")).toBeInTheDocument();
  });

  it("should apply justify-end for user messages", () => {
    render(<ChatMessage message={mockUserMessage} />);
    const container = screen.getByTestId("chat-message");
    expect(container).toHaveClass("justify-end");
  });

  it("should apply justify-start for system messages", () => {
    render(<ChatMessage message={mockSystemMessage} />);
    const container = screen.getByTestId("chat-message");
    expect(container).toHaveClass("justify-start");
  });
});

// =============================================================================
// InputBox Component Tests
// =============================================================================

describe("InputBox", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("should render input and button", () => {
    render(<InputBox onSubmit={mockOnSubmit} isLoading={false} />);
    expect(
      screen.getByPlaceholderText(/enter website url/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should call onSubmit when form is submitted", async () => {
    const user = userEvent.setup();
    render(<InputBox onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/enter website url/i);
    const button = screen.getByRole("button");

    await user.type(input, "https://example.com");
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith("https://example.com");
  });

  it("should not submit empty input", async () => {
    const user = userEvent.setup();
    render(<InputBox onSubmit={mockOnSubmit} isLoading={false} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should disable button when loading", () => {
    render(<InputBox onSubmit={mockOnSubmit} isLoading={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show loading text when loading", () => {
    render(<InputBox onSubmit={mockOnSubmit} isLoading={true} />);
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
  });
});

// =============================================================================
// Button Component Tests
// =============================================================================

describe("Button", () => {
  it("should render with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText("Click me"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });

  it("should render as different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByText("Default")).toBeInTheDocument();

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByText("Destructive")).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText("Outline")).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText("Ghost")).toBeInTheDocument();
  });

  it("should render different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByText("Default")).toBeInTheDocument();

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });
});

// =============================================================================
// Badge Component Tests
// =============================================================================

describe("Badge", () => {
  it("should render with children", () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should render different variants", () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toBeInTheDocument();

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText("Destructive")).toBeInTheDocument();

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toBeInTheDocument();
  });
});

// =============================================================================
// Card Component Tests
// =============================================================================

describe("Card", () => {
  it("should render card with all parts", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Card content here</CardContent>
      </Card>
    );

    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Card content here")).toBeInTheDocument();
  });

  it("should accept custom className", () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    );
    expect(screen.getByTestId("card")).toHaveClass("custom-class");
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe("Component Integration", () => {
  it("should render multiple chat messages", () => {
    const messages: CrawlMessage[] = [
      {
        id: "1",
        type: "user",
        content: "https://test.com",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "system",
        content: "Starting analysis...",
        timestamp: new Date(),
      },
      {
        id: "3",
        type: "status",
        content: "Crawling pages...",
        timestamp: new Date(),
        status: "crawling",
        crawlProgress: 50,
      },
    ];

    render(
      <div>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
    );

    expect(screen.getByText("https://test.com")).toBeInTheDocument();
    expect(screen.getByText("Starting analysis...")).toBeInTheDocument();
    expect(screen.getByText("Crawling pages...")).toBeInTheDocument();
    expect(screen.getAllByTestId("chat-message")).toHaveLength(3);
  });
});
