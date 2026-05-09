-- Allow clients to delete their own orders
CREATE POLICY "orders: delete own" ON orders FOR DELETE
  USING (client_id = auth.uid());
