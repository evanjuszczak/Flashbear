/*
  # Fix RLS policies for flashcard sets and flashcards

  1. Changes
    - Drop existing policies and recreate them with proper user_id checks
    - Ensure proper user association for all operations
  
  2. Security
    - Strengthen RLS policies to properly check user_id
    - Ensure users can only access their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can view their own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can update their own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can delete their own flashcard sets" ON flashcard_sets;
DROP POLICY IF EXISTS "Users can manage flashcards in their sets" ON flashcards;

-- Recreate policies with proper user_id checks
CREATE POLICY "Users can create their own flashcard sets"
  ON flashcard_sets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own flashcard sets"
  ON flashcard_sets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard sets"
  ON flashcard_sets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard sets"
  ON flashcard_sets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update flashcards policy to properly check set ownership
CREATE POLICY "Users can manage flashcards in their sets"
  ON flashcards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM flashcard_sets
      WHERE id = flashcards.set_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM flashcard_sets
      WHERE id = flashcards.set_id
      AND user_id = auth.uid()
    )
  );