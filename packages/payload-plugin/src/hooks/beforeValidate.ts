import type { CollectionBeforeValidateHook } from 'payload'

export const allowAnonymous: CollectionBeforeValidateHook = ({ data, req }) => {
  // If there is no user on the request, it's an anonymous submission.
  // Remove the `user` field from the data to prevent validation errors.
  if (!req.user && data && 'user' in data) {
    const { user, ...rest } = data
    return rest
  }

  return data
}