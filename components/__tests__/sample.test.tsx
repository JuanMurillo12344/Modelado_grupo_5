import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminHeader from '../admin-header';

test('renderiza el header de admin', () => {
  render(<AdminHeader />);
  expect(screen.getByText(/admin/i)).toBeInTheDocument();
});
