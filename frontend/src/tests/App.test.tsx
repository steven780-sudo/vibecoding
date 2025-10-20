import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText(/Chronos - 文件时光机/i)).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<App />);
    expect(screen.getByText(/欢迎使用 Chronos/i)).toBeInTheDocument();
  });

  it('renders the open repository button', () => {
    render(<App />);
    const buttons = screen.getAllByText(/打开仓库/i);
    expect(buttons.length).toBeGreaterThan(0);
  });
});
