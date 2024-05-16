from collections import defaultdict
import uuid


class UserSIDs(defaultdict):
    def __init__(self):
        super().__init__(set[str])

    def add_sid(self, user_id: uuid.UUID, sid: str):
        self[user_id].add(sid)

    def remove_sid(self, user_id: uuid.UUID, sid: str):
        self[user_id].discard(sid)
        if not self[user_id]:
            self.pop(user_id, None)

    def remove_user(self, user_id: uuid.UUID):
        self.pop(user_id, None)
