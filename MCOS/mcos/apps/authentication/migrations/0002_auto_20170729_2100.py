# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-07-29 21:00
from __future__ import unicode_literals
from django.contrib.auth.hashers import make_password
from django.db import migrations
from django.contrib.auth.models import Permission
from django.contrib.auth.management import create_permissions
from django.contrib.auth.models import Group, Permission, User
from ..models import UserProfile,Role


def create_init_roles(apps, schema_editor):
    init_roles = [Role(role_name='admin'), Role(role_name='user')]
    for role in init_roles:
        role.save()


def add_permissions(apps, schema_editor):
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, verbosity=0)
        app_config.models_module = None


def create_init_administrator(apps, schema_editor):
    init_admin_user = User(
        username='admin',
        password=make_password('bkcloud'),
        email='admin@bkcloud.com'
    )
    init_admin_user.save()
    admin_permission = Permission.objects.filter(codename='admin_role').first()
    user_permission = Permission.objects.filter(codename='user_role').first()
    init_admin_user.user_permissions.add(admin_permission)
    init_admin_user.user_permissions.add(user_permission)
    init_admin_user.save()
    init_admin__user_profile = UserProfile(company='HPCC')
    admin_role = Role.objects.filter(role_name='admin').first()
    user_role = Role.objects.filter(role_name='user').first()
    init_admin__user_profile.user = init_admin_user
    init_admin__user_profile.save()
    init_admin__user_profile.roles.add(admin_role)
    init_admin__user_profile.roles.add(user_role)
    init_admin__user_profile.save()


class Migration(migrations.Migration):
    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_init_roles),
        migrations.RunPython(add_permissions),
        migrations.RunPython(create_init_administrator)
    ]
