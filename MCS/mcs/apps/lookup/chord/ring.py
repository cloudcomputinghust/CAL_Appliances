import hashlib
import random
from math import floor

from django.conf import settings
from lookup.chord import utils
from lookup.chord.node import Node


class Ring(object):

    def __init__(self, username, clouds):
        self.id = int(hashlib.md5(username).hexdigest(),
                      16) % settings.RING_SIZE
        self.size = settings.RING_SIZE
        self.nodes = []
        # clouds = [cloud1, cloud2, cloud3...]
        # # cloud1 = Cloud(type, config, address)
        # # cloud1 is an instance of class Cloud
        self.clouds = clouds
        self._gen_clouds_duplicate_list()

    def generate_ring(self, username):
        """Generate ring"""
        first_node = Node(username, 0, self.duplicates[0])
        first_node.join(first_node)
        self.nodes.append(first_node)
        for id in range(1, settings.RING_SIZE):
            node = Node(username, id, self.duplicates[id])
            node.join(first_node)
            self.nodes.append(node)

    def _calculate_sum_quota(self):
        """Calculate sum quota"""
        sum_quotas = 0
        for cloud in self.clouds:
            # TODO: Convert quotas from string to long/int
            sum_quotas += cloud.quota
        return sum_quotas

    def _set_weight_cloud(self):
        """Set cloud's weight:
        cloud.weight = cloud.quota / sum_quota"""
        sum_quotas = self._calculate_sum_quota()
        for cloud in self.clouds:
            cloud.set_weight(sum_quotas)

    def _gen_clouds_duplicate_list(self):
        """Create n duplicates per cloud."""
        self.duplicates = []
        # Number of duplicates (all clouds)
        total_duplicates = settings.RING_SIZE * 3
        self._set_weight_cloud()
        # Number duplicates per cloud (int)
        num_dupl_per_cloud = []
        for cloud in self.clouds:
            num_dupl_per_cloud.append(floor(cloud.weight * total_duplicates))
        # Re-check
        if sum(num_dupl_per_cloud) != total_duplicates:
            rand_elm = random.randrange(0, len(num_dupl_per_cloud))
            num_dupl_per_cloud[
                rand_elm] += (total_duplicates - sum(num_dupl_per_cloud))
        # Create multi references of one cloud object.
        for map in zip(self.clouds, num_dupl_per_cloud):
            for i in range(map[1]):
                _fork = map[0]
                self.duplicates.append(_fork)
        while True:
            # Shuffle duplicates
            random.shuffle(self.duplicates)
            if utils.check_diff_seq_elements(self.duplicates):
                break
        self.duplicates = [list(e) for e in zip(
            self.duplicates[:-1], self.duplicates[1:], self.duplicates[2:])]
