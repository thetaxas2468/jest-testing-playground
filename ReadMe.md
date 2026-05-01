# Minimal Jest Mocking, Spy & Unit Testing Playground

A JavaScript learning project demonstrating practical Jest techniques — mocks, spies, fake APIs, fake timers, and blackbox integration testing — organized into progressively complex examples.

## What this project covers

- `jest.fn()` — creating standalone mock functions and controlling return values
- `jest.spyOn()` — wrapping real functions to observe calls without replacing them
- `jest.mock()` — replacing entire modules with auto-mocked versions
- `mockResolvedValue` / `mockRejectedValue` — faking async API success and failure
- `jest.useFakeTimers()` — controlling `setTimeout` without real waiting
- `expect.objectContaining()` — partial object matching on API call assertions
- Blackbox integration testing — treating a feature as a black box via mocked APIs

## Project structure

```
src/
  atm/              — ATM machine (auth, bank API, session, logger)
  deliveryApp/      — Delivery app (cart, orders, payments, promos)
  services/         — Misc service examples
  utils/            — Pure utility functions

tests/
  atm/              — 5 files: basic → spyOn → module mocks → fake API → fake timers
  deliveryApp/      — 6 files: cart → ordering → payment → negative → edge cases → API contract
  services/         — Service-level unit tests
```

## Running tests

```bash
npm test                  # all tests
npm run test:coverage     # all tests + coverage report
npm run test:atm          # ATM tests only
npm run test:delivery     # delivery app tests only
```

Open `coverage/index.html` in a browser for the full interactive coverage report.
