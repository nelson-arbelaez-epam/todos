import { render } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
  it('renders the RegisterScreen', () => {
    const { getByText } = render(<App />);
    expect(getByText('Create an account')).toBeTruthy();
  });
});
