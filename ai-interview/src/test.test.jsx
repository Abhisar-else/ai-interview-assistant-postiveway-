import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Basic Application Sanity Check', () => {
  it('should find the welcome message (GREEN)', () => {
    render(<div>Welcome back, Candidate!</div>);
    // This will pass now
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });
});
