export function handleOpenAIError(err: unknown): never {
  // Narrow the error type – OpenAI API errors inherit from Error and expose a `code` field we can inspect.
  const error = err as { code?: string; message?: string } & Error;

  // Log full error stack for observability.

  console.error('OpenAI API error', error);

  let message = 'OpenAI request failed';

  // Provide more specific feedback where possible.
  switch (error.code) {
    case 'rate_limit_exceeded':
    case '429':
      message = 'Rate limit exceeded – please try again shortly.';
      break;
    case 'authentication_error':
    case '401':
      message = 'Authentication with OpenAI failed – check your API key.';
      break;
    case 'insufficient_quota':
      message = 'You have exhausted your OpenAI quota.';
      break;
    default:
      if (error.message) message = error.message;
  }

  throw new Error(message);
}
