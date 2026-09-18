import React from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../design-system";

export function NotFoundPage() {
  return (
    <div className="mx-auto mt-16 max-w-md">
      <EmptyState
        icon="\u{1F9ED}"
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={{ label: "Back to dashboard", onClick: () => { window.location.href = "/"; } }}
      />
      <p className="mt-3 text-center text-sm">
        <Link to="/" className="text-brand-600 hover:underline">Return home</Link>
      </p>
    </div>
  );
}
