import type { ClientRegistredContacts, ClientUnlinkedContacts } from "../..";

 export function isRegisteredContact(
    client: ClientRegistredContacts | ClientUnlinkedContacts,
  ): client is ClientRegistredContacts {
    return (client as ClientRegistredContacts).user !== undefined
  }
