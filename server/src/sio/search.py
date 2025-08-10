from itertools import islice
import uuid
from pygtrie import CharTrie
from ..database import db_session
from ..users.crud import search_users
from ..rooms.crud import search_tag


class UserTrie:
    __trie = CharTrie()

    class UserEntry:
        def __init__(self, name: str, profile_picture_id: uuid.UUID | None):
            self.name = name
            self.profile_picture_id = profile_picture_id

    @staticmethod
    async def build():
        async with db_session() as db:
            for user in await search_users(db=db, username="", limit=None):
                UserTrie.add_user(username=(await user.awaitable_attrs.account_data).username, name=user.name,
                                  profile_picture_id=user.profile_picture_id)

    @staticmethod
    def add_user(username: str, name: str, profile_picture_id: uuid.UUID | None):
        UserTrie.__trie[username] = UserTrie.UserEntry(name=name, profile_picture_id=profile_picture_id)
    
    @staticmethod
    def update_user_name(username: str, name: str):
        UserTrie.__trie[username].name = name

    @staticmethod
    def change_username(old_username: str, new_username: str):
        UserTrie.__trie[new_username] = UserTrie.__trie.pop(old_username)

    @staticmethod
    def update_user_profile_picture(username: str, profile_picture_id: uuid.UUID | None):
        UserTrie.__trie[username].profile_picture_id = profile_picture_id

    @staticmethod
    def search(prefix: str, limit: int = 10):
        return [items for items in islice(UserTrie.__trie.iteritems(prefix=prefix), limit)] \
            if UserTrie.__trie.has_subtrie(prefix) or prefix in UserTrie.__trie else []
    

class TagTrie:
    __trie = CharTrie()

    @staticmethod
    async def build():
        async with db_session() as db:
            for tag in await search_tag(db=db, tag_name="", limit=None):
                TagTrie.add_tag(tag=tag.tag)

    @staticmethod
    def add_tag(tag: str):
        TagTrie.__trie[tag] = True

    @staticmethod
    def search(prefix: str, limit: int = 10):
        return [tag for tag in islice(TagTrie.__trie.iterkeys(prefix=prefix), 10)] \
            if TagTrie.__trie.has_subtrie(prefix) or prefix in TagTrie.__trie else []
