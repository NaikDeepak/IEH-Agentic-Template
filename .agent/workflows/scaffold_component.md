---
description: "Scaffold a new React component with TDD and Apple/Airbnb Design Standards"
---
1. Ask the user for the component name (e.g., "HeroSection").
2. **TDD STEP 1 (RED):** Create the **TEST** file first in `components/__tests__/[ComponentName].test.tsx`.
   ```tsx
   import { render, screen } from '@testing-library/react';
   import { describe, it, expect } from 'vitest';
   import { [ComponentName] } from '../[ComponentName]';

   describe('[ComponentName]', () => {
     it('renders successfully', () => {
       render(<[ComponentName] title="Test Title" />);
       expect(screen.getByText('Test Title')).toBeInTheDocument();
     });
   });
   ```
3. **TDD STEP 2 (GREEN):** Create the component file in `components/[ComponentName].tsx`.
   - **Persona:** Principal Design Engineer.
   - **Priorities:** Visuals, Mobile-First, Accessibility.
   ```tsx
   import React from 'react';

   interface [ComponentName]Props {
     title: string;
   }

   /**
    * [ComponentName]
    * 
    * Design Philosophy: Minimalist, "Dribbble-worthy" aesthetic.
    */
   export const [ComponentName]: React.FC<[ComponentName]Props> = ({ title }) => {
     return (
       <section className="w-full py-12 px-4 md:px-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm">
         <div className="max-w-4xl mx-auto">
           <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
             {title}
           </h2>
         </div>
       </section>
     );
   };
   ```
4. Export the component in `components/index.ts`.
5. Run the specific test to confirm it passes.
// turbo
6. npm run test components/__tests__/[ComponentName].test.tsx
