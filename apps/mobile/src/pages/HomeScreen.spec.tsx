import { render, screen } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';

import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  it('renders authenticated home content from props', () => {
    render(<HomeScreen currentUserEmail="user@example.com" />);

    expect(screen.getByText('You are signed in')).toBeTruthy();
    expect(screen.getByText('Welcome, user@example.com.')).toBeTruthy();
    expect(screen.getByText('Welcome to the design system')).toBeTruthy();
  });
});
