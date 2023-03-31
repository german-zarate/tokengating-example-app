import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";

import { myAppMetafieldNamespace, myHandle } from "./constants.js";

const GATES_QUERY = `
  query getGateConfigurations($first: Int!) {
    gateConfigurations(query: "handle:${myHandle}", first: $first) {
      nodes {
        id
        name
        handle
        requirements: metafield(namespace: "${myAppMetafieldNamespace}",
          key: "requirements") {
            value
        }
        reaction: metafield(namespace: "${myAppMetafieldNamespace}",
          key: "reaction") {
            value
        }
        subjectBindings(first: $first) {
          nodes {
            id
          }
          totalCount
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export default async function retrieveGates(session) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    const gates = await client.query({
      data: {
        query: GATES_QUERY,
        variables: {
          first: 20,
        },
      },
    });
    return gates.body.data.gateConfigurations.nodes;
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
