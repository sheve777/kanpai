import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /kanpAI/i });
  expect(titleElement).toBeInTheDocument();
  
  const loginButton = screen.getByRole('button', { name: /ログイン/i });
  expect(loginButton).toBeInTheDocument();
  
  const passwordInput = screen.getByPlaceholderText(/パスワードを入力/i);
  expect(passwordInput).toBeInTheDocument();
});
