import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByText(/Chronos - 文件时光机/i)).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<App />)
    expect(
      screen.getByText(/欢迎使用 Chronos MVP 开发环境/i)
    ).toBeInTheDocument()
  })
})
