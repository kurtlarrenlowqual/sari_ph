import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page for unauthenticated user', () => {
  render(<App />);
  expect(screen.getByText(/SariPH POS Login/i)).toBeInTheDocument();
});
