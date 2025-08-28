
"use strict";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const cleanupPendingOnInvitationAccept = functions.firestore
  .document("events/{eventId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Get the list of collaborators before and after the update
    const beforeCollaborators = beforeData.collaborators || [];
    const afterCollaborators = afterData.collaborators || [];

    // Find the newly added collaborator
    const newCollaborator = afterCollaborators.find(
      (collaborator: string) => !beforeCollaborators.includes(collaborator)
    );

    if (newCollaborator) {
      // If a new collaborator was added, check if they were in pending
      const pendingCollaborators = afterData.pendingCollaborators || [];
      if (pendingCollaborators.includes(newCollaborator)) {
        // Remove the user from the pending list
        return change.after.ref.update({
          pendingCollaborators: admin.firestore.FieldValue.arrayRemove(
            newCollaborator
          ),
        });
      }
    }

    return null;
  });
