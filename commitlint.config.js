module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'fix',
                'docs',
                'chore',
                'style',
                'refactor',
                'ci',
                'test',
                'perf',
                'revert',
                'vercel',
                'update',
                'major',
                'minor',
                "patch",
                "build",
                "release",
                "run",
                "add"
            ]
        ]
    }
}