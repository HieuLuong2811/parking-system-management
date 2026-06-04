# FastAPI Project - Backend

## Link Swagger

http://localhost:8000/api/v1/docs

## Requirements

- [Docker](https://www.docker.com/).
- Python 3.10

## Docker Compose

Start the local development environment with Docker Compose following the guide in [../development.md](../development.md).

## General Workflow

1. From `./backend/`, create and activate a virtual environment:

   ```console
   $ python -m venv .venv
   $ source .venv/bin/activate     # On Windows use `.venv\\Scripts\\activate`
   ```

2. Install the pinned dependencies from the repository root:

   ```console
   $ pip install -r ../requirements.txt
   ```

3. Run the application:

   ```console
   $ python -m uvicorn app.main:app --host localhost --port 8000 --reload
   ```

Be sure your editor is using `backend/.venv/bin/python` (or the Windows equivalent interpreter).

### Computer vision dependencies

The detection service depends on `ultralytics`, `opencv-python`, `numpy`, and `pytesseract`, all provided via `requirements.txt`. In addition, the Tesseract runtime must be installed on your host (e.g., `sudo apt install tesseract-ocr` on Debian/Ubuntu) for OCR to work.

Modify or add SQLModel models for data and SQL tables in `./backend/app/models.py`, API endpoints in `./backend/app/api/`, CRUD (Create, Read, Update, Delete) utils in `./backend/app/crud.py`.

## Security Console Tools

The `security_console_tools` folder contains standalone GUI/tools scripts. To run them, first change into that directory from `./backend/`, then execute the desired Python file.

```console
$ cd security_console_tools
$ python security_console.py
$ python security_console_qr.py
$ python banner.py
$ python banner_client.py
```

If you are using a virtual environment, make sure it is activated before running the commands above.

## Migrations

As during local development your app directory is mounted as a volume inside the container, you can also run the migrations with `alembic` commands inside the container and the migration code will be in your app directory (instead of being only inside the container). So you can add it to your git repository.

Make sure you create a "revision" of your models and that you "upgrade" your database with that revision every time you change them. As this is what will update the tables in your database. Otherwise, your application will have errors.

- Start an interactive session in the backend container:

```console
$ docker compose exec backend bash
```

- Alembic is already configured to import your SQLModel models from `./backend/app/models.py`.

- After changing a model (for example, adding a column), inside the container, create a revision, e.g.:

```console
$ alembic revision --autogenerate -m "Add column last_name to User model"
```

- Commit to the git repository the files generated in the alembic directory.

- After creating the revision, run the migration in the database (this is what will actually change the database):

```console
$ docker compose exec web bash
$ cd backend
$ alembic -c alembic/env.py upgrade head
$ alembic upgrade heads
```

If you don't want to use migrations at all, uncomment the lines in the file at `./backend/app/core/db.py` that end in:

```python
SQLModel.metadata.create_all(engine)
```

and comment the line in the file `scripts/prestart.sh` that contains:

```console
$ alembic upgrade heads
```

If you end up with multiple migration versions marked as head, Alembic will not know which branch to follow and will raise an error. To resolve this, you need to create a new migration that merges these heads into a single version:

```console
$ alembic merge -m "Merge multiple heads" <version-1> <version-2>
$ alembic upgrade heads
```

If you don't want to start with the default models and want to remove them / modify them, from the beginning, without having any previous revision, you can remove the revision files (`.py` Python files) under `./backend/app/alembic/versions/`. And then create a first migration as described above.

## Email Templates

The email templates are in `./backend/app/email-templates/`. Here, there are two directories: `build` and `src`. The `src` directory contains the source files that are used to build the final email templates. The `build` directory contains the final email templates that are used by the application.

Before continuing, ensure you have the [MJML extension](https://marketplace.visualstudio.com/items?itemName=attilabuti.vscode-mjml) installed in your VS Code.

Once you have the MJML extension installed, you can create a new email template in the `src` directory. After creating the new email template and with the `.mjml` file open in your editor, open the command palette with `Ctrl+Shift+P` and search for `MJML: Export to HTML`. This will convert the `.mjml` file to a `.html` file and now you can save it in the build directory.
