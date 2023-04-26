import { GraphQLInputType, GraphQLNonNull, GraphQLOutputType, isListType, isNamedType, isNonNullType, isScalarType } from 'graphql'


const render = (
  type: GraphQLOutputType | GraphQLInputType,
  nonNull: boolean,
  root: boolean,
  undefinableValues: boolean,
  undefinableFields: boolean,
  wrap: (x: string) => string = x => x,
  isResponse: boolean
): string => {
    
  if (root) {
    if (undefinableFields) {
      if (isNonNullType(type)) {
        return `: ${render(type.ofType, true, false, undefinableValues, undefinableFields, wrap, isResponse)}`
      } else {
        const rendered = render(type, true, false, undefinableValues, undefinableFields, wrap, isResponse)
        return undefinableValues ? `?: ${rendered}` : `?: (${rendered} | null)`
      }
    } else {
      return `: ${render(type, false, false, undefinableValues, undefinableFields, wrap, isResponse)}`
    }
  }

  if (isNamedType(type)) {
    let typeName = type.name

    // if is a scalar use the scalar interface to not expose reserved words
    if (isScalarType(type)) {
      typeName =
        undefinableValues || undefinableFields
          ? `Scalars['${typeName}']`
          : `ResponseScalars['${typeName}']`;
    }

    const typing = wrap(typeName)

    if (undefinableValues) {
      return nonNull ? typing : `(${typing} | undefined)`
    } else {
      return nonNull ? typing : `(${typing} | null)`
    }
  }

  if (isListType(type)) {
    const typing = `${render(type.ofType, false, false, undefinableValues, undefinableFields, wrap, isResponse)}[]`

    if (undefinableValues) {
      return nonNull ? typing : `(${typing} | undefined)`
    } else {
      return nonNull ? typing : `(${typing} | null)`
    }
  }

  return render((<GraphQLNonNull<any>>type).ofType, true, false, undefinableValues, undefinableFields, wrap, isResponse)
}

export const renderTyping = (
  type: GraphQLOutputType | GraphQLInputType,
  undefinableValues: boolean,
  undefinableFields: boolean,
  root = true,
  wrap: any = undefined,
  isResponse = false
) => render(type, false, root, undefinableValues, undefinableFields, wrap, isResponse)
