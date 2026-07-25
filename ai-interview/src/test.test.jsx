import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Basic Application Sanity Check', () => {
  it('should fail to find the welcome message (RED)', () => {
    render(<div>Wrong Welcome Message</div>);
    // This will fail because the rendered text doesn't match the regex
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });
});
